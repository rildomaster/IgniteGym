import { Center, Heading } from 'native-base';

type Props = {
    title: string;
}

export function Header({ title }: Props) {
    return (
        <Center bg='gray.600' pt={16} pb={6} px={4}>
            <Heading color='gray.100' fontSize='xl' noOfLines={1} fontFamily='heading'>
                {title}
            </Heading>
        </Center>
    );
}