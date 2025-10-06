import { DISCOVER_LAST_SEEN_EVENT } from '@/constants/events';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Badge, Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';




export default function TabLayout() {
  const { user } = useAuth();
  const [discoverBadge, setDiscoverBadge] = useState<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDiscoverBadge = useCallback(async () => {
    if (!user?.id) {
      if (isMountedRef.current) {
        setDiscoverBadge(null);
      }
      return;
    }

    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('last_seen_discover_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      const lastSeen = settingsData?.last_seen_discover_at ?? null;
      const since = lastSeen ?? new Date(0).toISOString();

      const { count, error: storiesError } = await supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .gt('updated_at', since);

      if (storiesError) throw storiesError;

      if (isMountedRef.current) {
        setDiscoverBadge(count ?? 0);
      }
    } catch (err) {
      console.error('[Tabs] Failed to load Discover badge', err);
      if (isMountedRef.current) {
        setDiscoverBadge(null);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    loadDiscoverBadge();
  }, [loadDiscoverBadge]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(DISCOVER_LAST_SEEN_EVENT, () => {
      loadDiscoverBadge();
    });

    return () => {
      subscription.remove();
    };
  }, [loadDiscoverBadge]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel('discover-badge-stories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        loadDiscoverBadge();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadDiscoverBadge]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel(`discover-badge-settings-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadDiscoverBadge();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadDiscoverBadge]);

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
        <Label>Discover</Label>
        <Icon sf={"magnifyingglass"} drawable="ic_menu_settings" />
        {discoverBadge && discoverBadge > 0 ? <Badge>{String(discoverBadge)}</Badge> : null}
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
