

## Profil Ekranı ve Profil Fotoğrafı Yükleme

### Yapılacaklar

1. **Storage bucket oluştur** -- `avatars` adında public bir storage bucket ve RLS politikaları oluşturacak bir migration yazılacak. Kullanıcılar kendi klasörlerine dosya yükleyip okuyabilecek.

2. **Profil sayfası oluştur** (`src/pages/Profile.tsx`) -- Kullanıcının adını düzenleyebileceği bir input, profil fotoğrafı yükleyebileceği bir dosya seçici (file input + önizleme), ve kaydet butonu içeren basit bir sayfa. `supabase.storage.from('avatars').upload()` ile dosya yüklenecek, public URL alınıp `profiles` tablosundaki `avatar_url` güncellenecek.

3. **Route ekle** (`src/App.tsx`) -- `/profile` rotası eklenecek.

4. **Header'a profil linki ekle** (`src/components/AppHeader.tsx`) -- Kullanıcının avatarını gösteren tıklanabilir bir avatar butonu eklenecek, tıklayınca `/profile` sayfasına yönlendirecek. Mevcut e-posta metni yerine avatar + isim gösterilecek.

5. **Avatar gösterimlerini güncelle** (`src/components/RequestCard.tsx` vb.) -- `avatar_url` varsa `AvatarImage` ile gerçek fotoğrafı göster.

### Teknik Detaylar

- Storage bucket migration: `INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)` + RLS policies for authenticated users
- Dosya yolu: `{user_id}/{timestamp}.{ext}` formatında
- Profil güncelleme: `supabase.from('profiles').update({ full_name, avatar_url }).eq('user_id', userId)`
- `useProfiles` hook'u zaten mevcut, profil sayfasında da kullanılacak

