export const AuthLayout = ({ children }) => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-8 p-3 md:p-10">
      <div className="flex items-center justify-center gap-2">
        <img src="logo.png" alt="Faved logo" className="w-[28px] h-auto" />
        <h2 className="text-xl font-semibold tracking-tight">Faved</h2>
      </div>
      {children}
    </div>
  );
};
