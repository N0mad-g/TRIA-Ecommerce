export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="font-serif text-5xl font-bold mb-4 text-emerald-400">
          Ciência para reconstruir sua identidade
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          TRIA - Premium Hair Treatment Protocols
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/quiz"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition"
          >
            Iniciar Diagnóstico
          </a>
          <a
            href="/catalog"
            className="border border-slate-400 hover:bg-slate-800 text-slate-100 font-bold py-3 px-8 rounded-lg transition"
          >
            Ver Catálogo
          </a>
        </div>
      </div>
    </main>
  )
}
