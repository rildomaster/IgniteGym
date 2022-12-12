import { Platform } from 'react-native';
import { useTheme } from 'native-base';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs'

import { Home } from '@screens/Home';
import { History } from '@screens/History';
import { Profile } from '@screens/Profile';
import { Exercise } from '@screens/Exercise';

import IconHome from '@assets/home.svg';
import IconHistory from '@assets/history.svg';
import IconProfile from '@assets/profile.svg';

type AppRoutes = {
    home: undefined;
    history: undefined;
    profile: undefined;
    exercise: { exerciseId: string };
}

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator<AppRoutes>();

export function AppRoutes() {

    const { sizes, colors } = useTheme();
    const iconSize = sizes[6];

    return (
        <Navigator 
            screenOptions={{ 
                headerShown: false, 
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.green[500],
                tabBarInactiveTintColor: colors.gray[200],
                tabBarStyle: {
                    height: Platform.OS === 'android' ? 'auto' : 96,
                    paddingBottom: sizes[10],
                    paddingTop: sizes[8],

                    backgroundColor: colors.gray[600],
                    borderTopWidth: 0,
                    borderTopStartRadius: 16,
                    borderTopEndRadius: 16,
                }
            }}
        >

            <Screen 
                name='home' component={Home} 
                options={{ 
                    tabBarIcon: ({ color }) => <IconHome fill={color} width={iconSize} height={iconSize} /> 
                }}
            />
            
            <Screen 
                name='history' component={History}
                options={{ 
                    tabBarIcon: ({ color }) => <IconHistory fill={color} width={iconSize} height={iconSize} /> 
                }}
            />
            
            <Screen 
                name='profile' component={Profile} 
                options={{ 
                    tabBarIcon: ({ color }) => <IconProfile fill={color} width={iconSize} height={iconSize} /> 
                }}
            />
            
            <Screen name='exercise' component={Exercise} options={{ tabBarButton: () => null }} />
        </Navigator>
    );
}