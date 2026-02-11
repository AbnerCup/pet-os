export const DEFAULT_IMAGES = {
    dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400&h=400',
    cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400&h=400',
    generic: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400&h=400'
};

const API_ROOT = 'http://192.168.1.38:3001';

export function getPetImage(photoUrl?: string | null, species?: string): string {
    if (photoUrl && photoUrl.trim() !== '') {
        // Si es una ruta relativa del backend, añadir el dominio
        if (photoUrl.startsWith('/uploads/')) {
            return `${API_ROOT}${photoUrl}`;
        }
        return photoUrl;
    }

    const s = species?.toLowerCase();
    if (s === 'dog' || s === 'perro') return DEFAULT_IMAGES.dog;
    if (s === 'cat' || s === 'gato') return DEFAULT_IMAGES.cat;

    return DEFAULT_IMAGES.generic;
}

export function calculateAge(birthDate: string): string {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age.toString();
}
