// 1. We ONLY import 'List' and 'Row' from the library
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from 'react-native';
import { List, Row } from 'react-native-ios-list';

const genresList = [
  { id: '1', name: 'Beginner', icon: 'leaf.fill' },
  { id: '2', name: 'Intermediate', icon: 'lightbulb.fill' },
  { id: '3', name: 'Advanced', icon: 'star.fill' },
  { id: '4', name: 'Native', icon: 'heart.fill' },
];

export default function GenresCard() {
  
  const handleGenrePress = (genreName: string) => {
    console.log(`Navigating to ${genreName}`);
  };

  return (
    <List
    style={{
      marginBottom: 72,
    }}
      header={
        <Text style={{
          color: 'black',
          fontWeight: '600',
          fontSize: 18,
          paddingBottom: 8,
        }}>
          Levels
        </Text>
      }
      inset={false}
    >
      {genresList.map((genre) => (
        <Row
          key={genre.id}
          onPress={() => handleGenrePress(genre.name)}
          leading={<IconSymbol name={genre.icon} color="#000000" size={16} />}
          trailing={<IconSymbol name="chevron.right" color="#777777" size={12} />}
          style={{
            marginLeft: -20,
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '400',
            letterSpacing: 0.25,
          }}>{genre.name}</Text>
        </Row>
      ))}
    </List>
  );
}