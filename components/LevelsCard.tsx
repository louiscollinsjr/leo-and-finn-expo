// 1. We ONLY import 'List' and 'Row' from the library
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text, PlatformColor } from 'react-native';
import { List, Row } from 'react-native-ios-list';

const levelsList = [
  { id: 'beginner', name: 'Beginner', icon: 'leaf.fill' },
  { id: 'intermediate', name: 'Intermediate', icon: 'lightbulb.fill' },
  { id: 'advanced', name: 'Advanced', icon: 'star.fill' },
  { id: 'native', name: 'Native', icon: 'heart.fill' },
] as const;

export default function LevelsCard() {
  const handleLevelPress = (levelName: string) => {
    console.log(`Navigating to ${levelName}`);
  };

  return (
    <List
      header={
        <Text
          style={{
            color: PlatformColor('label'),
            fontWeight: '600',
            fontSize: 18,
            paddingBottom: 8,
          }}
        >
          Levels
        </Text>
      }
      inset={false}
    >
      {levelsList.map((level) => (
        <Row
          key={level.id}
          onPress={() => handleLevelPress(level.name)}
          leading={<IconSymbol name={level.icon} color="#000000" size={16} />}
          trailing={<IconSymbol name="chevron.right" color="#777777" size={12} />}
          style={{
            marginLeft: -20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '400',
            }}
          >
            {level.name}
          </Text>
        </Row>
      ))}
    </List>
  );
}