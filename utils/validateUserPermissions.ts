type User = {
  permissions: string[];
  roles: string[];
};
type validateUserPermissionsProps = {
  user?: User;
  //caso as rotas/páginas/componentes tem permissões para validar
  permissions?: string[];
  roles?: string[];
};

//passamos as permissões e roles para validar
export function validateUserPermissions({
  user,
  permissions,
  roles,
}: validateUserPermissionsProps) {
  //caso haver user undefined
  if (!user) return false;
  //caso haver permissões !undefined ou > 0
  if (permissions) {
    //verifica da lista permissões e retorna true se user tem todas permissões, caso uma é diferente retorna falso
    const hasAllPermissions = permissions?.every((permission) =>
      user?.permissions.includes(permission)
    );
    if (!hasAllPermissions) return false;
  }

  //caso haver roles !undefined ou > 0
  if (roles) {
    //verifica da lista roles e retorna true se user tem todas roles, caso uma é diferente retorna falso
    const hasAllRoles = roles?.some((role) => user?.roles.includes(role));
    if (!hasAllRoles) return false;
  }

  //caso passar todas as condições
  return true;
}
