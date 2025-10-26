import {Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle} from "@/components/ui/dialog.tsx";
import EditItemForm from "@/components/EditForm/EditItemForm.tsx";
import {observer} from "mobx-react-lite";
import {useContext} from "react";
import {StoreContext} from "@/store/storeContext.ts";

export const EditItemDialog = observer(() => {
  const store = useContext(StoreContext);

  return <Dialog onOpenChange={store.setIsShowEditModal} open={store.isShowEditModal}>
    <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}
                   className="p-0 w-[100dvw] md:w-[95dvw] max-w-6xl rounded-none md:rounded-lg">
      <DialogTitle className="sr-only">Edit Item</DialogTitle>
      <EditItemForm isCloseWindowOnSubmit={false}/>
    </DialogContent>
  </Dialog>
})