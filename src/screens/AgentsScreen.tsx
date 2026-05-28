import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { colors, fonts } from '@/theme/tokens';
import { useSessionList, useSessions } from '@/lib/store';
import { chipTone, toneColor } from '@/lib/types';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Agents'>;

export function AgentsScreen({ navigation }: Props) {
  const sessions = useSessionList();
  const setActive = useSessions((s) => s.setActive);

  return (
    <Screen>
      <TermAppBar title="agents" />
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.dim}>no sessions yet — start one from repos</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setActive(item.id);
              navigation.navigate('Session');
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.greek}>{item.greekId}</Text>
            <View style={styles.col}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.repo.name} · {item.branch}</Text>
            </View>
            <Text style={[styles.chip, { color: toneColor(chipTone(item.state)) }]}>
              {item.state}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 8 },
  dim: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 12, padding: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgElev1,
  },
  rowPressed: { backgroundColor: colors.bgElev2 },
  greek: { color: colors.rose, fontFamily: fonts.monoFallback, fontSize: 18, width: 22 },
  col: { flex: 1, gap: 2 },
  name: { color: colors.textHi, fontFamily: fonts.monoFallback, fontSize: 13 },
  meta: { color: colors.textLo, fontFamily: fonts.monoFallback, fontSize: 11 },
  chip: { fontFamily: fonts.monoFallback, fontSize: 11, letterSpacing: 0.6 },
});
