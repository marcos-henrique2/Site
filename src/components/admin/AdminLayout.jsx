import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Home } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  // Os links do seu menu lateral
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/produtos', label: 'Produtos', icon: Package },
    { path: '/admin/categorias', label: 'Categorias', icon: FolderTree },
    { path: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Menu Lateral (Sidebar) */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold font-space text-primary">Mallki Print</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Botão para voltar para a loja */}
        <div className="p-4 border-t border-border">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Home className="w-5 h-5" />
            Ver a Loja
          </Link>
        </div>
      </aside>

      {/* Área onde o conteúdo das páginas vai aparecer */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}