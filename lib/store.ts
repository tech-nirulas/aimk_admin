import { api } from "@/redux/api";
import { reducer } from "@/redux/reducer";
import { env } from "@/utils/constants";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

console.log(env);

const store = configureStore({
  reducer: {
    ...reducer,
    ...Object.fromEntries(
      Object.entries(api).map(([key, apiService]) => [
        apiService.reducerPath,
        apiService.reducer,
      ]),
    ),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(...Object.values(api).map((service) => service.middleware)),
  devTools: env !== "production",
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
