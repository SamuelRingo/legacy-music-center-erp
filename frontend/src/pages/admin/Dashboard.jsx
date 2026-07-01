export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Super Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Siswa Aktif</p>
          <p className="text-3xl font-bold">--</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Guru</p>
          <p className="text-3xl font-bold">--</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Jadwal Hari Ini</p>
          <p className="text-3xl font-bold">--</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Kehadiran Hari Ini</p>
          <p className="text-3xl font-bold">--</p>
        </div>
      </div>
      <p className="text-gray-500 italic">🚧 Menu lengkap sedang dikembangkan...</p>
    </div>
  );
}
