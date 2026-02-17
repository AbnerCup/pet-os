import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { logger, LogEntry, LogLevel } from '../../utils/logger';
import { useFocusEffect } from '@react-navigation/native';

interface LogItemProps {
  log: LogEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

const LogItem: React.FC<LogItemProps> = ({ log, isExpanded, onToggle }) => {
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return '#e74c3c';
      case LogLevel.WARN:
        return '#f39c12';
      case LogLevel.DEBUG:
        return '#3498db';
      default:
        return '#2ecc71';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.logItem, { borderLeftColor: getLevelColor(log.level) }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.logHeader}>
        <View style={[styles.levelBadge, { backgroundColor: getLevelColor(log.level) }]}>
          <Text style={styles.levelText}>{log.level}</Text>
        </View>
        <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
        <Text style={styles.logScreen}>[{log.screen}]</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#666"
        />
      </View>
      <Text style={styles.logMessage} numberOfLines={isExpanded ? undefined : 1}>
        {log.message}
      </Text>
      {isExpanded && log.data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Datos:</Text>
          <Text style={styles.dataText}>
            {JSON.stringify(log.data, null, 2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const DevLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');

  const loadLogs = useCallback(async () => {
    try {
      const storedLogs = await logger.getStoredLogs();
      setLogs(storedLogs);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Limpiar Logs',
      '¿Estás seguro de que quieres eliminar todos los logs almacenados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await logger.clearLogs();
            setLogs([]);
          },
        },
      ]
    );
  };

  const handleFlushLogs = async () => {
    try {
      await logger.flush();
      Alert.alert('Éxito', 'Logs enviados al servidor');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron enviar los logs');
    }
  };

  const handleShareLogs = () => {
    // En una implementación real, podrías usar Share API
    const logsText = JSON.stringify(logs, null, 2);
    Alert.alert(
      'Compartir Logs',
      `Total de logs: ${logs.length}\n\nLos logs están listos para compartir.`,
      [{ text: 'OK' }]
    );
  };

  const filteredLogs = filter === 'ALL' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const stats = {
    total: logs.length,
    error: logs.filter(l => l.level === LogLevel.ERROR).length,
    warn: logs.filter(l => l.level === LogLevel.WARN).length,
    info: logs.filter(l => l.level === LogLevel.INFO).length,
    debug: logs.filter(l => l.level === LogLevel.DEBUG).length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5c7a4b" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs de la App</Text>
        <Text style={styles.subtitle}>Desarrollo & Debugging</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statItem, styles.statError]}>
          <Text style={[styles.statNumber, styles.statErrorText]}>{stats.error}</Text>
          <Text style={[styles.statLabel, styles.statErrorText]}>Errores</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.warn}</Text>
          <Text style={styles.statLabel}>Warnings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.info}</Text>
          <Text style={styles.statLabel}>Info</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.debug}</Text>
          <Text style={styles.statLabel}>Debug</Text>
        </View>
      </ScrollView>

      <View style={styles.filterContainer}>
        {(['ALL', LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG] as const).map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.filterButton, filter === level && styles.filterButtonActive]}
            onPress={() => setFilter(level)}
          >
            <Text style={[styles.filterText, filter === level && styles.filterTextActive]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleFlushLogs}>
          <Ionicons name="cloud-upload" size={20} color="#5c7a4b" />
          <Text style={styles.actionText}>Enviar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShareLogs}>
          <Ionicons name="share-outline" size={20} color="#5c7a4b" />
          <Text style={styles.actionText}>Exportar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.actionButtonDanger]} onPress={handleClearLogs}>
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          <Text style={[styles.actionText, styles.actionTextDanger]}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <LogItem
            log={item}
            isExpanded={expandedId === item.id}
            onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No hay logs almacenados</Text>
            <Text style={styles.emptySubtext}>
              Los logs se generan automáticamente mientras usas la app
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  statError: {
    backgroundColor: '#fee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statErrorText: {
    color: '#e74c3c',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 4,
  },
  filterButtonActive: {
    backgroundColor: '#5c7a4b',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f5ee',
  },
  actionButtonDanger: {
    backgroundColor: '#fee',
  },
  actionText: {
    marginLeft: 6,
    color: '#5c7a4b',
    fontWeight: '500',
  },
  actionTextDanger: {
    color: '#e74c3c',
  },
  listContent: {
    padding: 10,
  },
  logItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logTime: {
    fontSize: 11,
    color: '#999',
    marginRight: 8,
  },
  logScreen: {
    fontSize: 11,
    color: '#5c7a4b',
    flex: 1,
  },
  logMessage: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  dataContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  dataLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  dataText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DevLogsScreen;
