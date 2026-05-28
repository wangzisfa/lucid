import React from 'react';
import { Text, Pressable, FlatList, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '@/components/Screen';
import { TermAppBar } from '@/components/TermAppBar';
import { colors, fonts } from '@/theme/tokens';
import { fileNodes, rootFileIds } from '@/lib/mock-files';
import { useFiles } from '@/lib/files-store';
import type { RootStackParamList } from '@/navigation/RootStack';

type Props = NativeStackScreenProps<RootStackParamList, 'Files'>;

/** Flatten the tree honoring open folders, for a simple vim-style list. */
function visibleRows(open: Set<string>): string[] {
  const out: string[] = [];
  const walk = (ids: string[]) => {
    for (const id of ids) {
      out.push(id);
      const node = fileNodes[id];
      if (node?.kind === 'folder' && open.has(id) && node.children) {
        walk(node.children);
      }
    }
  };
  walk(rootFileIds);
  return out;
}

export function FilesScreen(_props: Props) {
  const open = useFiles((s) => s.openFolders);
  const cursor = useFiles((s) => s.cursor);
  const setCursor = useFiles((s) => s.setCursor);
  const toggleFolder = useFiles((s) => s.toggleFolder);

  const rows = visibleRows(open);

  return (
    <Screen>
      <TermAppBar title="files" />
      <FlatList
        data={rows}
        keyExtractor={(id) => id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const node = fileNodes[item];
          if (!node) return null;
          const sel = cursor === item;
          return (
            <Pressable
              onPress={() => {
                setCursor(item);
                if (node.kind === 'folder') toggleFolder(item);
              }}
              style={[styles.row, { paddingLeft: 12 + node.depth * 16 }, sel && styles.rowSel]}
            >
              <Text style={[styles.name, sel && styles.nameSel]}>
                {node.kind === 'folder' ? (open.has(item) ? '▾ ' : '▸ ') : '  '}
                {node.name}
              </Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  row: { paddingVertical: 6, paddingRight: 12 },
  rowSel: { backgroundColor: 'rgba(255,138,180,0.08)', borderLeftWidth: 2, borderLeftColor: colors.rose },
  name: { color: colors.textMid, fontFamily: fonts.monoFallback, fontSize: 13 },
  nameSel: { color: colors.textHi },
});
