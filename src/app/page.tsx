// 1. Importamos a instância que acabamos de criar na pasta lib
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // 2. Este código roda no SERVIDOR (Back-end). 
  // O teste é tentar buscar os perfis que já estão no banco.
  // Ao digitar "prisma.", o VS Code deve sugerir "tipo_perfil"
  const perfis = await prisma.tipo_perfil.findMany();

  return (
    <main className="p-10 font-sans">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        SGEA - Sistema de Gestão de Eventos
      </h1>
      
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Teste de Conexão com o Banco:
        </h2>
        
        {perfis.length > 0 ? (
          <ul className="space-y-2">
            {perfis.map((perfil) => (
              <li key={perfil.id_tipo_perfil} className="bg-gray-200 p-3 rounded border border-gray-300">
                <span className="font-mono font-bold text-green-600">[{perfil.id_tipo_perfil}]</span> - {perfil.descricao}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500">Conectado, mas nenhum perfil encontrado.</p>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Se você está vendo os perfis acima, a integração <strong>Next.js + Prisma + Supabase</strong> está funcionando 100%!
      </p>
    </main>
  );
}