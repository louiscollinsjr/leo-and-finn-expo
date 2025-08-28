import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Story = {
  id: string;
  title: string;
  description?: string;
  cover: string;
  accentColors?: [string, string]; // Optional gradient colors
};

export const FeaturedStory = ({ story }: { story: Story }) => {
  // Default gradient colors if not provided
  const colors = story.accentColors || ['#ef4444', '#b91c1c'];
  
  return (
    <View style={{
      marginBottom: 24,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 3,
      width: '100%',
      height: 380,
    }}>
      <Pressable
        style={({ pressed }) => ([
          {
            width: '100%',
            height: '100%',
            opacity: pressed ? 0.96 : 1,
          }
        ])}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top headline */}
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '700' }} numberOfLines={2}>
            {story.title}
          </Text>
        </View>

        {/* Center content - could be a logo */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {story.cover ? (
            <Image source={{ uri: story.cover }} style={{ width: 180, height: 60 }} resizeMode="contain" />
          ) : (
            <Text style={{ color: '#ffffff', fontSize: 40, fontWeight: '600' }}>Leo & Finn</Text>
          )}
        </View>

        {/* Bottom caption/CTA */}
        <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, paddingHorizontal: 20, alignItems: 'center' }}>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>Try Leo & Finn</Text>
          {story.description ? (
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4, textAlign: 'center' }} numberOfLines={2}>
              {story.description}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
};

export default FeaturedStory;
