 import { useEffect, useState, ReactNode } from "react";
 import { setCurrentUserId } from "@/lib/auth";
 
 interface AuthProviderProps {
   children: ReactNode;
 }
 
 const AuthProvider = ({ children }: AuthProviderProps) => {
   const [isInitializing, setIsInitializing] = useState(true);
 
   useEffect(() => {
     const performHandshake = async () => {
       try {
         const urlParams = new URLSearchParams(window.location.search);
         const token = urlParams.get("token");
 
         if (token) {
           const response = await fetch("https://api.mantracare.com/user/user-info", {
             method: "POST",
             headers: {
               "Content-Type": "application/json",
             },
             body: JSON.stringify({ token }),
           });
 
           if (response.ok) {
             const data = await response.json();
             if (data.user_id) {
               setCurrentUserId(data.user_id);
             }
             
             // Remove token from URL without triggering navigation
             urlParams.delete("token");
             const newUrl = urlParams.toString()
               ? `${window.location.pathname}?${urlParams.toString()}`
               : window.location.pathname;
             window.history.replaceState({}, "", newUrl);
           }
           // If response not ok, silently continue (demo mode)
         }
         // If no token, silently continue (demo mode)
       } catch (error) {
         // On any error, silently continue (demo mode)
         console.log("Auth handshake skipped:", error);
       } finally {
         setIsInitializing(false);
       }
     };
 
     performHandshake();
   }, []);
 
   if (isInitializing) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
           <p className="text-muted-foreground text-sm">Loading...</p>
         </div>
       </div>
     );
   }
 
   return <>{children}</>;
 };
 
 export default AuthProvider;