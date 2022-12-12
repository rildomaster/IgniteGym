import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { VStack, Image, Center, Text, Heading, ScrollView, useToast } from 'native-base';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';

import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { useAuth } from '@hooks/useAuth';

import BackgroundImg from '@assets/background.png';
import LogoSvg from '@assets/logo.svg';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { AppError } from '@utils/AppError';

type SignInFormProps = {
    email: string;
    password: string;
}

const sigInShema = yup.object({
    email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
    password: yup.string().required('Informe a senha.')
});

export function SignIn() {

    const [ loading, setLoading ] = useState(false);
    const navigation = useNavigation<AuthNavigatorRoutesProps>();
    const { signIn }  = useAuth();

    const toast = useToast();
    const { control, handleSubmit, formState: { errors } } = useForm<SignInFormProps>({ resolver: yupResolver(sigInShema) });

    function handleSignUp() {
        navigation.navigate('signUp');
    }

    async function handleSignIn({ email, password } : SignInFormProps) {

        try {

            setLoading(true);
            await signIn(email, password);

        } catch (error) {

            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível logar na aplicação. Tente novamente'
            toast.show({ title, bg: 'red.500', placement: 'top', alignItems: 'center' });
            
            setLoading(false);
        }
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
                        Acesse sua conta
                    </Heading>

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
                                   returnKeyType='done' onSubmitEditing={handleSubmit(handleSignIn)}
                            />
                        )}
                    />

                    <Button title='Acessar' onPress={handleSubmit(handleSignIn)} isLoading={loading} />
                </Center>

                <Center mt={24}>
                    <Text color='gray.100' fontFamily='body' fontSize='sm' mb={3}>
                        Ainda não tem acesso?
                    </Text>

                    <Button title='Criar Conta' variant='outline' onPress={handleSignUp} />
                </Center>

            </VStack>
        </ScrollView>
    );
}