import { HStack, Text, Pressable, IPressableProps } from 'native-base';

type Props = IPressableProps & {
    name: string;
    selected?: boolean;
}

export function Group({ name, selected = false, ...rest }: Props) {

    function handleGroupItem() {

    }

    return (
        <Pressable 
            onPress={handleGroupItem} 
            h={10}
            w={24}
            mr={3}
            bg='gray.600'
            rounded='md'
            overflow='hidden'
            justifyContent='center'
            alignItems='center'

            _pressed={{ borderWidth: 1, borderColor: 'green.500' }}

            isPressed={selected}

            {...rest}
        >

            <Text 
                color={ selected ? 'green.500' : 'gray.200' } 
                textTransform='uppercase' 
                fontSize='xs' 
                fontWeight='bold'
                >
                {name}
            </Text>
        </Pressable>
    );
}