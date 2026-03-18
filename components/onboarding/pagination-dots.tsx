import { View } from 'react-native';

import { useOnboardingStyles } from './styles';

type PaginationDotsProps = {
  total: number;
  current: number;
};

export function PaginationDots({ total, current }: PaginationDotsProps) {
  const { dots: styles } = useOnboardingStyles();

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}
