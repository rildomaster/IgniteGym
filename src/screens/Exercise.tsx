import { useState, useEffect } from 'react';
import { VStack, Heading, Text, Icon, HStack, Image, Box, ScrollView, useToast } from 'native-base';
import { TouchableOpacity } from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { api } from '@services/api';
import { ExerciseDTO } from '@dtos/ExerciseDTO';
import { AppError } from '@utils/AppError';

import { Feather } from '@expo/vector-icons';

import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionsSvg from '@assets/repetitions.svg';

import { Button } from '@components/Button';
import { Loading } from '@components/Loading';

type RouteParamsProps = {
    exerciseId: string;
}

export function Exercise() {

    const [ isLoading, setIsLoading ] = useState(true);
    const [ checkIsLoading, setCheckIsLoading ] = useState(false);
    const [ currentExercise, setCurrentExercise ] = useState<ExerciseDTO>({} as ExerciseDTO);

    const navigation = useNavigation<AppNavigatorRoutesProps>();
    const { params } = useRoute();
    const { exerciseId } = params as RouteParamsProps;

    const toast = useToast();

    function handleGoback() {
        navigation.goBack();
    }

    async function getExerciseById() {
        
        try {
            setIsLoading(true);

            const { data } = await api.get(`/exercises/${exerciseId}`);
            setCurrentExercise(data);
            
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os detalhes do exercício.';

            toast.show({ title, placement: 'top', bg:'red.500' });

        }finally{
            setIsLoading(false);
        }
    }

    async function handleCheckExercise() {
        
        try {
            setCheckIsLoading(true);

            await api.post('/history', { exercise_id: exerciseId });

            toast.show({ title: 'Exercício marcado com sucesso.', placement: 'top', bg:'green.500' });

            navigation.navigate('history');
            
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível marcar o exercício.';

            toast.show({ title, placement: 'top', bg:'red.500' });

        }finally{
            setCheckIsLoading(false);
        }
    }

    useEffect(() => {
        getExerciseById();
    }, [exerciseId]);

    return (
        <VStack flex={1}>

            <VStack bg='gray.600' pt={12} px={8} pb={6}>
                <TouchableOpacity onPress={handleGoback}>
                    <Icon as={Feather} name='arrow-left' size={6} color='green.500' />
                </TouchableOpacity>

                <HStack justifyContent='space-between' mt={4} alignItems='center'>
                    <Heading color='gray.100' fontSize='lg' flexShrink={1} fontFamily='heading'>
                        {currentExercise.name}
                    </Heading>

                    <HStack alignItems='center'>
                        <BodySvg />
                        <Text color='gray.200' ml={1} fontSize='sm' textTransform='capitalize' noOfLines={1}>{currentExercise.group}</Text>
                    </HStack>

                </HStack>
            </VStack>

            {
                isLoading ?
                <Loading />
                :
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>

                    <VStack p={8}>

                        <Box mb={3} rounded='lg' overflow='hidden'>
                            <Image w='full' h={80} resizeMode='cover' rounded='lg' overflow='hidden'
                                alt='Exercício'
                                source={{ uri: `${api.defaults.baseURL}/exercise/demo/${currentExercise.demo}` }}
                            />
                        </Box>

                        <Box bg='gray.600' rounded='md' pb={4} px={4}>
                            
                            <HStack alignItems='center' justifyContent='space-around' mb={6} mt={5}>

                                <HStack>
                                    <SeriesSvg />
                                    <Text color='gray.200' ml='2'>{currentExercise.series} séries</Text>
                                </HStack>

                                <HStack>
                                    <RepetitionsSvg />
                                    <Text color='gray.200' ml='2'>{currentExercise.repetitions} repetições</Text>
                                </HStack>

                            </HStack>

                            <Button title='Marcar como realizado' onPress={handleCheckExercise} isLoading={checkIsLoading} />

                        </Box>

                    </VStack>

                </ScrollView>
            }

        </VStack>
    );
}