import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { observer } from "mobx-react-lite"
import {useContext, useState} from "react"
import { StoreContext } from "@/store/storeContext"
import {Navigate, useNavigate} from "react-router-dom"


export const Setup = observer(({ className, ...props }: React.ComponentProps<"div">) => {
    const store = useContext(StoreContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false)

    const submit = async () => {
        setIsLoading(true);
        const success = await store.initializeDatabase();
        if (success) {
            navigate('/setup/auth', {replace: true});
        }
        setIsLoading(false);
    }

    if (!isLoading && !store.showInitializeDatabasePage) {
        return <Navigate to="/" replace />;
    }

    return (

      <div className="flex flex-col items-center justify-center text-left min-h-svh w-full p-3 gap-8">
          <div className="flex items-center justify-center gap-2.5">
              <img
                src="logo.png"
                alt="Faved logo"
                className="w-[30px] h-auto"
              />
              <h2 className="text-2xl font-semibold tracking-tight">Faved</h2>
          </div>
          <Card className='max-w-3xl'>
              <CardHeader>
                  <CardTitle>Welcome to Faved!</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                  <p className="mb-4">Before you can use the application, we need to set up the database. Click the button below to proceed.</p>

                  <div className="bg-blue-100 p-4 rounded-lg mb-4 dark:bg-blue-600">
                      <p className="italic mb-2"><strong>Note:</strong> This will create a database file in the <code>/storage</code> folder of your application installation directory.</p>
                  </div>
              </CardContent>
              <CardFooter>
                  <Button className="bg-black hover:bg-black text-white font-bold py-2 px-4 rounded w-full" disabled={isLoading} onClick={ submit }>
                      {isLoading ? 'Creating Database...' : 'Create Database'}
                  </Button>
              </CardFooter>
          </Card>
      </div>
    )
})
