import { useState } from 'react';
import { VStack, ScrollView, Text, Center, Skeleton, Heading, useToast } from 'native-base';
import { TouchableOpacity } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { AppError } from '@utils/AppError';
import { api } from '@services/api';
import { useAuth } from '@hooks/useAuth';

import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Header } from '@components/Header';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

const PHOTO_SIZE = 32;

type UpdateDataForm = {
    name: string;
    email: string;
    currentPassword: string;
    password: string;
    passwordConfirm: string;
}

const updateSchema = yup.object({
    name: yup.string().required('Informe o nome.'),
    currentPassword: yup.string(),
    password: yup.string().min(6, 'A senha deve ter no mínimo 6 dígitos.').nullable().transform((value) => !!value ? value : null),
    passwordConfirm: yup
        .string()
        .oneOf([yup.ref('password')], 'A senha informada não confere.')
        .nullable()
        .transform((value) => !!value ? value : null)
        .when('password', { 
            is: (Field: any) => Field, 
            then: yup
                .string()
                .required('Confirme a senha.')
                .nullable()
                // .transform((value) => !!value ? value : null)
            })
});

export function Profile() {

    const [ isUpdating, setIsUpdating ] = useState(false);
    const [ photoIsLoading, setPhotoIsLoading ] = useState(false);

    const toast = useToast();
    const { user, updateUserProfile } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<UpdateDataForm>(
        { 
            defaultValues: { name: user.name, email: user.email },
            resolver: yupResolver(updateSchema)
        });

    

    async function handleSelectPhoto() {
        
        setPhotoIsLoading(true);

        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
                base64: false
            });
            
            //caso a a seleção seja cancelada
            if(photoSelected.canceled){
                return;
            }
            
            if(!photoSelected.assets[0].uri){
                return;
            }

            const fileUri = photoSelected.assets[0].uri;
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            const fileSize = (fileInfo.size ?? 0);

            if(fileSize <= 0){
                return toast.show({ bg: 'red.500', placement: 'top', title: 'A foto selecionada não é válida.' });
            }

            if((fileSize / 1024 / 1024) > 5){ //verificando se é maior que 5MB
                return toast.show({ bg: 'red.500', placement: 'top', title: 'A foto selecionada não pode ser maior que 5Mb.' });
            }

            
            //Fazer upload da imagem
            const fileExt = fileUri.split('.').pop();
            const photoFile = {
                name: `${user.name}.${fileExt}`.toLowerCase(),
                uri: fileUri,
                type: `${photoSelected.assets[0].type}/${fileExt}`
            } as any;

            const photoUploadForm = new FormData();
            photoUploadForm.append('avatar', photoFile);

            const { data } = await api.patch('/users/avatar', photoUploadForm, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            //-----------------------
            
            //setPhotoUser(fileUri);
            const userUpdated = user;
            userUpdated.avatar = `${data.avatar}`;
            await updateUserProfile(userUpdated);

            toast.show({ bg: 'green.500', placement: 'top', title: 'Foto atualizada com sucesso!!', });

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar a foto de perfil.';

            toast.show({ title, placement: 'top', bg:'red.500' });

        } finally {
            setPhotoIsLoading(false);
        }
    }

    async function handleUpdateProfile({ name, password, currentPassword }: UpdateDataForm) {

        try {
            setIsUpdating(true);

            await api.put('/users', { name, password, old_password: currentPassword });

            const userUpdated = user;
            userUpdated.name = name;

            await updateUserProfile(userUpdated);

            toast.show({ title: 'Perfil atualizado com sucesso.', placement: 'top', bg:'green.500' });

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível atualizar o perfil.';

            toast.show({ title, placement: 'top', bg:'red.500' });

        }finally{
            setIsUpdating(false);
        }
    }

    return (
        <VStack flex={1} >
            <Header title='Perfil' />
            
            <ScrollView mx={8} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>

                <Center mt={6}>
                    {
                        photoIsLoading ?
                        <Skeleton w={PHOTO_SIZE} h={PHOTO_SIZE} rounded='full' startColor='gray.300' endColor='gray.500' />
                        :
                        <UserPhoto size={PHOTO_SIZE} uri={user.avatar} />
                    }
                    
                    <TouchableOpacity onPress={handleSelectPhoto}>
                        <Text color='green.500' fontWeight='bold' fontSize='md' mt={2} mb={8}>Alterar Foto</Text>
                    </TouchableOpacity>
                    
                    <Controller 
                        name='name' 
                        control={control} 
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder='Nome' bg='gray.600' 
                                   onChangeText={onChange} value={value} errorMessage={errors.name?.message}
                            />
                        )} 
                    />

                    <Controller 
                        name='email'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder='E-mail' bg='gray.600' isDisabled 
                                   onChangeText={onChange} value={value} 
                            />
                        )}
                    />


                    <Heading color='gray.200' fontWeight='bold' fontSize='md' mt={4} mb={2} alignSelf='flex-start' fontFamily='heading'>Alterar Senha</Heading>

                    <Controller 
                        name='currentPassword'
                        control={control}
                        render={({ field: { onChange } }) => (
                            <Input placeholder='Senha antiga' bg='gray.600' secureTextEntry 
                                   onChangeText={onChange} errorMessage={errors.currentPassword?.message}
                            />
                        )}
                    />

                    <Controller 
                        name='password'
                        control={control}
                        render={({ field: { onChange } }) => (
                            <Input placeholder='Nova senha' bg='gray.600' secureTextEntry 
                                   onChangeText={onChange} errorMessage={errors.password?.message}
                            />
                        )}
                    />

                    <Controller 
                        name='passwordConfirm'
                        control={control}
                        render={({ field: { onChange } }) => (
                            <Input placeholder='Confirme a nova senha' bg='gray.600' secureTextEntry
                                   onChangeText={onChange} errorMessage={errors.passwordConfirm?.message}
                            />
                        )}
                    />

                    <Button title='Atualizar' mt={4} onPress={handleSubmit(handleUpdateProfile)} isLoading={isUpdating} />
                </Center>

            </ScrollView>

        </VStack>
    );
}