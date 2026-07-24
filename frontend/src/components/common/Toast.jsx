// Toast rendering itself lives inside ToastContext.jsx (the provider owns
// the toast stack's state), so this file only re-exports the hook for
// components that want to trigger a toast - keeping a single source of
// truth per Appendix A ("no duplicated logic").
export { useToast as default } from "../../context/ToastContext.jsx";
