import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';




export default function TabLayout() {

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home" disableScrollToTop>
        <Label>Home</Label>
        <Icon sf={"house.fill"} drawable="ic_menu_mylocation" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library" disableScrollToTop >
        <Label>Library</Label>
        <Icon sf={"books.vertical.fill"} drawable="ic_menu_settings" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="browse" disableScrollToTop>
        <Label>Browse</Label>
        <Icon sf={"magnifyingglass"} drawable="ic_menu_settings" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="play-and-learn" disableScrollToTop>
        <Label>Play and Learn</Label>
        <Icon sf={"gamecontroller.fill"} drawable="ic_menu_settings" />
        {/* <Badge>1</Badge> */}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
    

  // return (
  //   <Tabs
  //     initialRouteName="home"
  //     screenOptions={{
  //       tabBarActiveTintColor: '#fe2c55',
  //       headerShown: false,
  //       tabBarButton: HapticTab,
  //       tabBarBackground: TabBarBackground,
  //       tabBarStyle: Platform.select({
  //         ios: {
  //           // Use a transparent background on iOS to show the blur effect
  //           position: 'absolute',
  //         },
  //         default: {},
  //       }),
  //     }}>
  //     <Tabs.Screen
  //       name="home"
  //       options={{
  //         title: 'Home',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
  //       }}
  //     />
  //     <Tabs.Screen
  //       name="library"
  //       options={{
  //         title: 'Library',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="books.vertical.fill" color={color} />,
  //       }}
  //     />
  //     <Tabs.Screen
  //       name="browse"
  //       options={{
  //         title: 'Browse',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
  //       }}
  //     />
  //     <Tabs.Screen
  //       name="play-and-learn"
  //       options={{
  //         title: 'Play and Learn',
  //         tabBarIcon: ({ color }) => <IconSymbol size={28} name="gamecontroller.fill" color={color} />,
  //       }}
  //     />
  //   </Tabs>
  // );
}
