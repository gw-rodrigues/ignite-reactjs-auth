import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

type UsePermissionsProps = {
  permissions?: string[] | undefined;
  roles?: string[] | undefined;
};

export function UsePermissions({ permissions, roles }: UsePermissionsProps) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return false;

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
