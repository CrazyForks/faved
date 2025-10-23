import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog.tsx";
import EditItemForm from "@/components/EditForm/EditItemForm.tsx";
import {observer} from "mobx-react-lite";
import {useContext} from "react";
import {StoreContext} from "@/store/storeContext.ts";

export const EditItemDialog = observer(() => {
  const store = useContext(StoreContext);

  return <Dialog onOpenChange={store.setIsShowEditModal} open={store.isShowEditModal} >
    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}  className="p-0">
      <DialogTitle className="sr-only">Edit Item</DialogTitle>
       <EditItemForm isCloseWindowOnSubmit={false} />
    </DialogContent>
  </Dialog>
})