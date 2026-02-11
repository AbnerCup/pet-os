import React from 'react';
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
import { usePets } from '../../hooks/usePets';
import { useAuth } from '../../hooks/useAuth';
import { Pet } from '../../types';
import { MainTabScreenProps } from '../../navigation/types';

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

const PetCard: React.FC<{ pet: Pet; onPress: () => void }> = ({ pet, onPress }) => (
  <TouchableOpacity style={styles.petCard} onPress={onPress}>
    <Image
      source={{ uri: pet.photoUrl || 'https://via.placeholder.com/100' }}
      style={styles.petImage}
    />
    <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
    <Text style={styles.petBreed} numberOfLines={1}>{pet.species}</Text>
  </TouchableOpacity>
);

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
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: pets, isLoading, refetch } = usePets();

  const stats = {
    totalPets: pets?.length || 0,
    expenses: '$0',
    pending: 0,
    appointments: 0,
  };

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
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Mascotas"
          value={stats.totalPets}
          icon="paw"
          color="#7c9a6b"
          onPress={() => navigation.navigate('Pets')}
        />
        <StatCard
          title="Gastos"
          value={stats.expenses}
          icon="wallet"
          color="#4a90e2"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon="time"
          color="#f5a623"
        />
        <StatCard
          title="Citas"
          value={stats.appointments}
          icon="calendar"
          color="#e74c3c"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis Mascotas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Pets')}>
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
        <AlertItem
          icon="medical"
          color="#e74c3c"
          title="Vacuna pendiente"
          message="Luna necesita su vacuna anual"
          time="Hace 2 horas"
        />
        <AlertItem
          icon="calendar"
          color="#4a90e2"
          title="Cita veterinaria"
          message="Chequeo mensual de Max"
          time="Mañana, 10:00 AM"
        />
        <AlertItem
          icon="medication"
          color="#f5a623"
          title="Medicación"
          message="Recordatorio: Pastilla diaria"
          time="Hoy, 8:00 PM"
        />
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
        data={pets?.slice(0, 5)}
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
    padding: 16,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
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
