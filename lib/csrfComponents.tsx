import React from 'react';

// Componente para incluir el token CSRF en formularios (versión cliente)
export function CsrfTokenField({ token }: { token: string }) {
    return <input type="hidden" name="csrf_token" value={token} />;
}
