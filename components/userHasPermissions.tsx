import { ReactNode, useContext } from "react";
import { UseCheckPermissions } from "../hooks/useCheckPermissions";

type UserHasPermissionsProps = {
  children: ReactNode;
  permissions?: string[] | undefined;
  roles?: string[] | undefined;
};

export function UserHasPermissions({
  children,
  permissions,
  roles,
}: UserHasPermissionsProps) {
  //vamos fazer a validação das permissões e roles, caso true poder ver o componente passado pelo children
  const userCanSeeComponent = UseCheckPermissions({ permissions, roles });
  //caso for false retornamos null
  if (!userCanSeeComponent) return null;

  return <>{children}</>;
}
