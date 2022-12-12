import { useState, useCallback } from 'react';
import { VStack, Center, SectionList, Text, Heading, useToast } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { useAuth } from '@hooks/useAuth';

import { HistoryDTO } from '@dtos/HistoryDTO';

import { Header } from '@components/Header';
import { HistoryCard } from '@components/HistoryCard';
import { Loading } from '@components/Loading';

type ExerciceProps = {
    title: string;
    data: HistoryDTO[];
}

export function History() {

    const [ isLoading, setIsLoading ] = useState(true);
    const [ exercices, setExercices ] = useState<ExerciceProps[]>([]);

    const toast = useToast();
    const { refreshedToken } = useAuth();

    async function loadHistory() {
        
        try {
            setIsLoading(true);

            const { data } = await api.get(`/history`);
            setExercices(data);
            
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError ? error.message : 'Não foi possível carregar o histórico de exercícios.';

            toast.show({ title, placement: 'top', bg:'red.500' });

        }finally{
            setIsLoading(false);
        }
    }

    useFocusEffect(useCallback(() => {
        loadHistory();
    }, [refreshedToken]));

    return (
        <VStack flex={1}>
            <Header title='Histórico de Exercícios' />

            {
                isLoading ?
                <Loading />
                : (exercices?.length > 0 ?
                    <SectionList
                        sections={exercices}
                        keyExtractor={item => item.id}
                        renderSectionHeader={({ section }) => (
                            <Heading color='gray.200' fontSize='md' mt={3} mb={3} fontFamily='heading'>
                                {section.title}
                            </Heading>
                        )}
                        renderItem={({item}) => (
                            <HistoryCard data={item} />
                        )}

                        mt={4} mx={6}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 36, flex: (exercices.length > 0 ? 0 : 1) }}
                    />
                    :
                    <Center flex={1}>
                        <Text color='gray.300'>Não há nada aqui :( {'\n'} Vamos se mexer né!!!</Text>
                    </Center>
                )
            }

        </VStack>
    );
}