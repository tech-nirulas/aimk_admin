"use client";

import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useFormDrawer } from "@/lib/FormDrawerProvider";
import CategoryForm from "./CategoryForm";

export default function CategoryActions({ row }: any) {
  const { openDrawer, setIsEditing } = useFormDrawer();

  const handleEdit = () => {
    setIsEditing(true);

    openDrawer({
      drawerName: "Edit Category",
      isEditing: true,
      children: <CategoryForm initialData={row} />,
      anchor: "right",
    });
  };

  return (
    <>
      <IconButton onClick={handleEdit}>
        <EditIcon />
      </IconButton>

      <IconButton color="error">
        <DeleteIcon />
      </IconButton>
    </>
  );
}