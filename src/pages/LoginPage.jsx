const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-[20px] shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-left">Login</h1>
        <p className="mb-6 text-gray-400">Login untuk menggunakan aplikasi</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Masukkan email anda"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Masukkan password anda"
              required
            />
          </div>
          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="w-[100px] bg-red-600 text-white py-2 font-bold rounded-lg hover:bg-red-700 transition"
            >
              Login
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          Belum punya akun?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Daftar
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
