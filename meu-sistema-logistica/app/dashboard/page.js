export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Menu lateral */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-800">LogiSystem</h1>
        <nav className="flex flex-col gap-2">
          <a href="#" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium">Dashboard</a>
          <a href="#" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Estoque</a>
          <a href="#" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Ordens de Compra</a>
          <a href="#" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Transferências</a>
          <a href="#" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Empresas e Setores</a>
          <a href="#" className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Relatórios</a>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        {/* Cards de resumo */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total de Produtos</p>
            <p className="text-2xl font-semibold text-gray-800">348</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Valor em Estoque</p>
            <p className="text-2xl font-semibold text-gray-800">R$ 84.200</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Pedidos Pendentes</p>
            <p className="text-2xl font-semibold text-gray-800">12</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Estoque Baixo</p>
            <p className="text-2xl font-semibold text-red-500">5 alertas</p>
          </div>
        </div>

        {/* Últimas movimentações */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Últimas Movimentações</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Produto</th>
                <th className="pb-3 font-medium">Setor</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Quantidade</th>
                <th className="pb-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-50">
                <td className="py-3">Parafuso M8</td>
                <td className="py-3">Manutenção</td>
                <td className="py-3"><span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">Entrada</span></td>
                <td className="py-3">200 un</td>
                <td className="py-3">14/03/2026</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3">Óleo Lubrificante</td>
                <td className="py-3">Produção</td>
                <td className="py-3"><span className="text-red-500 bg-red-50 px-2 py-1 rounded-md">Saída</span></td>
                <td className="py-3">10 lt</td>
                <td className="py-3">13/03/2026</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="py-3">Cabo Elétrico</td>
                <td className="py-3">Elétrica</td>
                <td className="py-3"><span className="text-blue-500 bg-blue-50 px-2 py-1 rounded-md">Transferência</span></td>
                <td className="py-3">50 m</td>
                <td className="py-3">13/03/2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

    </div>
  )
}