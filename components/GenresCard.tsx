// 1. We ONLY import 'List' and 'Row' from the library
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Text } from 'react-native';
import { List, Row } from 'react-native-ios-list';

const genresList = [
  { id: '1', name: 'Fiction & Literature', icon: 'book.closed.fill' },
  { id: '2', name: 'Mysteries & Thrillers', icon: 'magnifyingglass' },
  { id: '3', name: 'Nonfiction', icon: 'chart.bar.fill' },
  { id: '4', name: 'Romance', icon: 'heart.fill' },
  { id: '5', name: 'Health, Mind & Body', icon: 'brain.head.profile' },
  { id: '6', name: 'All Genres', icon: 'line.3.horizontal' },
];

export default function GenresCard() {
  
  const handleGenrePress = (genreName: string) => {
    console.log(`Navigating to ${genreName}`);
  };

  return (
    <List
      header="Genres"
      inset={false}
    >
      {genresList.map((genre) => (
        <Row
          key={genre.id}
          onPress={() => handleGenrePress(genre.name)}
          leading={<IconSymbol name={genre.icon} color="#000000" size={18} />}
          trailing={<IconSymbol name="chevron.right" color="#777777" size={12} />}
        >
          <Text>{genre.name}</Text>
        </Row>
      ))}
    </List>
  );
}