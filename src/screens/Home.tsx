import { useState, useEffect, useCallback } from 'react';
import { VStack, HStack, Heading, Text, FlatList, Center, useToast } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';

import { useNavigation } from '@react-navigation/native';
import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';

import { ExerciseDTO } from '@dtos/ExerciseDTO';

import { Loading } from '@components/Loading';
import { HomeHeader } from '@components/HomeHeader';
import { Group } from '@components/Group';
import { ExerciseCard } from '@components/ExerciseCard';

export function Home() {

    const [ isLoading, setIsLoading ] = useState(true);
    const [ groupSelected, setGroupSelected ] = useState('antebraço');
    const [ groups, setGroups ] = useState<string[]>([]);
    const [ exercises, setExercises ] = useState<ExerciseDTO[]>([]);

    const { navigate } = useNavigation<AppNavigatorRoutesProps>();
    const toast = useToast();

    function handleGroupSelect(groupIndex: number, groupName: string) {
        setGroupSelected(groupName);
    }

    function handleOpenExerciseDetails(exerciseId: string) {
        navigate('exercise', { exerciseId });
    }

    async function getGroups() {
        
        try {

          const { data } = await api.get('/groups');
          setGroups(data);

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os grupos musculares.';

            toast.show({ title, placement: 'top', bg:'red.500' });
        }
    }

    async function getExercisesByGroup() {
        try {

            setIsLoading(true);

            const { data } = await api.get(`/exercises/bygroup/${groupSelected}`);
            setExercises(data);

        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar os exercicios do grupo selecionado.';

            toast.show({ title, placement: 'top', bg:'red.500' });
        }finally{
            setIsLoading(false);
        }
    }


    useEffect(() => {
        getGroups();
    }, []);

    useFocusEffect(useCallback(() => {
        getExercisesByGroup()
    }, [groupSelected]));

    return (
        <VStack flex={1} >

            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <Group name={item} onPress={() => handleGroupSelect(index, item)} selected={groupSelected === item} />
                )}
                showsHorizontalScrollIndicator={false}
                horizontal
                my={6}
                maxH={10}
                minH={10}
                _contentContainerStyle={{ px: 4 }}
            />

            {
                isLoading ? 
                <Loading /> 
                :
                <VStack flex={1} px={6}>
                    <HStack justifyContent='space-between' mb={4}>
                        <Heading color='gray.200' fontSize='md' fontFamily='heading'>
                            Exercicios
                        </Heading>

                        <Text color='gray.200' fontSize='sm'>
                            {exercises.length}
                        </Text>
                    </HStack>

                    <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <ExerciseCard data={item} onPress={() => handleOpenExerciseDetails(item.id)} />
                        )}
                        ListEmptyComponent={() => (
                            <Center flex={1}>
                                <Text color='gray.300'>Não há nada aqui :( </Text>
                            </Center>
                        )}
                        showsVerticalScrollIndicator={false}
                        _contentContainerStyle={{ paddingBottom: 20, flex: exercises.length > 0 ? 0 : 1 }}
                    />
                </VStack>
            }


        </VStack>
    );
}