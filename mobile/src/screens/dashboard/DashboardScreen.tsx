import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePets } from '../../hooks/usePets';
import { useAuth } from '../../hooks/useAuth';
import { useAllLocations } from '../../hooks/useLocation';
import { Pet } from '../../types';
import { MainTabScreenProps, RootStackParamList } from '../../navigation/types';
import { getPetImage, calculateAge } from '../../utils/helpers';

type Props = MainTabScreenProps<'Dashboard'>;

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}> = ({ title, value, icon, color, onPress }) => (
  <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const PetCard: React.FC<{ pet: Pet; onPress: () => void }> = ({ pet, onPress }) => {
  const age = pet.birthDate ? calculateAge(pet.birthDate) : '-';

  return (
    <TouchableOpacity style={styles.petCard} onPress={onPress}>
      <Image
        source={{ uri: getPetImage(pet.photoUrl, pet.species) }}
        style={styles.petImage}
      />
      <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
      <Text style={styles.petBreed} numberOfLines={1}>{pet.breed || pet.species}</Text>
      <Text style={styles.petAge}>{age} años</Text>
    </TouchableOpacity>
  );
};

const AlertItem: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  message: string;
  time: string;
}> = ({ icon, color, title, message, time }) => (
  <View style={styles.alertItem}>
    <View style={[styles.alertIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.alertContent}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertMessage} numberOfLines={1}>{message}</Text>
      <Text style={styles.alertTime}>{time}</Text>
    </View>
  </View>
);

export const DashboardScreen: React.FC<Props> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { data: pets, isLoading, refetch } = usePets();
  const { data: locations } = useAllLocations();

  const stats = useMemo(() => {
    if (!pets || !Array.isArray(pets)) {
      return { totalPets: 0, expenses: 'Bs. 0', pending: 0, activities: 0 };
    }

    const totalExpenses = pets.reduce((sum, pet) => {
      const petExpensesArray = Array.isArray(pet.expenses) ? pet.expenses : [];
      const petTotal = petExpensesArray.reduce((s, e) => s + (Number(e.amount) || 0), 0);
      return sum + petTotal;
    }, 0);

    const pendingHealth = pets.reduce((count, pet) => {
      const records = Array.isArray(pet.healthRecords) ? pet.healthRecords : [];
      return count + (records.filter((h: any) => h.status === 'pending').length || 0);
    }, 0);

    const totalActivities = pets.reduce((sum, pet) => {
      return sum + (Array.isArray(pet.activities) ? pet.activities.length : 0);
    }, 0);

    return {
      totalPets: pets.length,
      expenses: `Bs. ${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`,
      pending: pendingHealth,
      activities: totalActivities,
    };
  }, [pets]);

  // Generar Alertas Reales
  const alerts = useMemo(() => {
    const list: any[] = [];

    // 1. Batería Baja (Urgente)
    if (locations && Array.isArray(locations)) {
      locations.forEach((item: any) => {
        if (item.location && item.location.battery !== undefined && item.location.battery < 20) {
          list.push({
            id: `batt-${item.pet.id}`,
            title: 'Batería Crítica',
            message: `${item.pet.name} tiene ${item.location.battery}% de batería`,
            time: 'Ahora',
            icon: 'battery-dead',
            color: '#e74c3c'
          });
        }
      });
    }

    // 2. Salud / Vacunas proximas
    if (pets && Array.isArray(pets)) {
      pets.forEach((pet: any) => {
        if (pet.healthRecords && Array.isArray(pet.healthRecords)) {
          pet.healthRecords.forEach((record: any) => {
            if (record.status === 'pending') {
              const date = record.nextDate ? new Date(record.nextDate) : new Date(record.date);
              const now = new Date();
              // Mostrar si es hoy o futuro cercano (o pasado vencido)
              list.push({
                id: `health-${record.id}`,
                title: record.type === 'vaccine' ? 'Vacuna Pendiente' : 'Cita Médica',
                message: `${pet.name}: ${record.notes || 'Revisión programada'}`,
                time: date.toLocaleDateString(),
                icon: 'medical',
                color: date < now ? '#e74c3c' : '#f5a623'
              });
            }
          });
        }
      });
    }

    // Ordenar por urgencia/fecha? Si, pero simple por ahora. Batería primero.
    // Limitar a 5
    return list.slice(0, 5);
  }, [pets, locations]);

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
          {alerts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{alerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Mascotas"
          value={stats.totalPets}
          icon="paw"
          color="#7c9a6b"
          onPress={() => navigation.navigate('Main', { screen: 'Pets' })}
        />
        <StatCard
          title="Gastos"
          value={stats.expenses}
          icon="wallet"
          color="#4a90e2"
          onPress={() => navigation.navigate('Expenses', {})}
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon="time"
          color="#f5a623"
          onPress={() => navigation.navigate('HealthHub', {})}
        />
        <StatCard
          title="Actividades"
          value={stats.activities || 0}
          icon="fitness"
          color="#34c759"
          onPress={() => navigation.navigate('Activities', {})}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis Mascotas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Pets' })}>
          <Text style={styles.seeAll}>Ver todas</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderFooter = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Alertas Recientes</Text>
      </View>

      <View style={styles.alertsContainer}>
        {alerts.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#ccc" />
            <Text style={{ color: '#999', marginTop: 8 }}>Todo está tranquilo</Text>
          </View>
        ) : (
          alerts.map((alert, index) => (
            <AlertItem
              key={index}
              icon={alert.icon as any}
              color={alert.color}
              title={alert.title}
              message={alert.message}
              time={alert.time}
            />
          ))
        )}
      </View>
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      {renderHeader()}

      <FlatList
        data={Array.isArray(pets) ? pets.slice(0, 5) : []}
        renderItem={({ item }) => (
          <PetCard
            pet={item}
            onPress={() => navigation.navigate('PetDetail', { petId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.petsList}
        ListEmptyComponent={
          <View style={styles.emptyPets}>
            <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPet')}
            >
              <Text style={styles.addButtonText}>Agregar mascota</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {renderFooter()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 30, // SafeArea
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#7c9a6b',
    fontSize: 14,
    fontWeight: '500',
  },
  petsList: {
    paddingHorizontal: 15,
    gap: 12,
  },
  petCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    marginBottom: 8,
  },
  petName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  petBreed: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  petAge: {
    fontSize: 11,
    color: '#7c9a6b',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  emptyPets: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#7c9a6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  alertsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 40,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  alertMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  alertTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});
