import { useState } from 'react';
import { VStack, Image, Center, Text, Heading, ScrollView, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@hooks/useAuth';

import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';

import BackgroundImg from '@assets/background.png';
import LogoSvg from '@assets/logo.svg';

import { Input } from '@components/Input';
import { Button } from '@components/Button';

type SignUpFormDataProps = {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

const signUpSchema = yup.object({
    name: yup.string().required('Informe o nome.'),
    email: yup.string().required('Inorme o e-mail.').email('E-mail inválido.'),
    password: yup.string().required('Inorme senha.').min(6, 'A senha deve ter no mínimo 6 dígitos.'),
    passwordConfirm: yup.string().required('Confirme a senha.').oneOf([yup.ref('password')], 'A senha informada não confere.')
});

export function SignUp() {
    const [ isLoading, setIsLoading ] = useState(false);

    const navigation = useNavigation();
    const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormDataProps>({ resolver: yupResolver(signUpSchema) });
    const toast = useToast();
    const { signIn } = useAuth();

    function handleGoBack() {
        navigation.goBack();
    }

    async function handleSignUp({ name, email, password }: SignUpFormDataProps) { //data: SignUpFormDataProps

        try {
            setIsLoading(true);

            await api.post('/users', { name, email, password });
            await signIn(email, password);

        } catch (error) {

            setIsLoading(false);

            const isAppError = error instanceof AppError;
            const errorMessage = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente';

            return toast.show({ title: `${errorMessage}`, bg: 'red.500', placement: 'top' });

            // if(axios.isAxiosError(error)) {
            //     return toast.show({ title: `${error.response?.data.message}`, bg: 'red.500', placement: 'top' });
            // }
        }
        
        // await fetch('http://192.167.0.29:3333/users', {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json', 'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(data)
        // })
        // .then(resp => {
        //     if(resp.ok){
        //         return toast.show({ title: `'${data.name}' sua conta foi criada com sucesso!!`, bg: 'green.500', placement: 'top', onCloseComplete() { handleGoBack(); } });
        //     }

        //     return toast.show({ title: `${resp}`, bg: 'red.500', placement: 'top' });
        // });

        //toast.show({ title: `'${name}' sua conta foi criada com sucesso!!`, bg: 'green.500', placement: 'top', onCloseComplete() { handleGoBack(); } });
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
            <VStack flex={1} px={10}>
                <Image 
                    source={BackgroundImg} 
                    defaultSource={BackgroundImg}
                    alt='Pessoas treinando' 
                    resizeMode='contain'
                    position='absolute'
                />

                <Center my={24}>
                    <LogoSvg />

                    <Text color='gray.100' fontSize='sm'>
                        Treine sua mente e o seu corpo
                    </Text>
                </Center>

                <Center>
                    <Heading color='gray.100' fontSize='xl' fontFamily='heading' mb={6}>
                        Crie sua conta
                    </Heading>

                    <Controller
                        control={control} 
                        name='name'
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder='Nome' 
                                   onChangeText={onChange} value={value} errorMessage={errors.name?.message}
                            />
                        )}
                    />

                    <Controller 
                        name='email'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder='E-mail' keyboardType='email-address' autoCapitalize='none' 
                                   onChangeText={onChange} value={value} errorMessage={errors.email?.message}
                            />
                        )}
                    />

                    <Controller 
                        name='password'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder='Senha' secureTextEntry 
                                   onChangeText={onChange} value={value} errorMessage={errors.password?.message}
                            />
                        )}
                    />

                    <Controller 
                        name='passwordConfirm'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Input placeholder='Confirmar senha' secureTextEntry 
                                   onChangeText={onChange} value={value} errorMessage={errors.passwordConfirm?.message}
                                   onSubmitEditing={handleSubmit(handleSignUp)} returnKeyType='send' 
                            /> 
                        )}
                    />

                    <Button title='Criar e Acessar' onPress={handleSubmit(handleSignUp)} isLoading={isLoading} />
                </Center>

                <Button title='Voltar para o Login' variant='outline' mt={6} onPress={handleGoBack} />

            </VStack>
        </ScrollView>
    );
}