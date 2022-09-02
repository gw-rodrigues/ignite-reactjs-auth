import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCheckPermissionsProps = {
  permissions?: string[];
  roles?: string[];
};

//todas HOOKS, que começam com "use*C*" so poder ser usados dentro componentes, nao funciona no lado servidor. ServerSideNext
export function UseCheckPermissions({
  permissions,
  roles,
}: UseCheckPermissionsProps) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return false;

  //verificar se o user tem todas as permissões - retorna true ou false
  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions;
}
