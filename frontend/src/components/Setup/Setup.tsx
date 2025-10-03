import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card"
import {observer} from "mobx-react-lite"
import {useContext, useState} from "react"
import {StoreContext} from "@/store/storeContext"
import {Navigate, useNavigate} from "react-router-dom"


export const Setup = observer(({className, ...props}: React.ComponentProps<"div">) => {
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)

  const submit = async () => {
    setIsLoading(true);
    const success = await store.initializeDatabase();
    if (success) {
      navigate('/', {replace: true});
    }
    setIsLoading(false);
  }

  if (!isLoading && !store.showInitializeDatabasePage) {
    return <Navigate to="/" replace/>;
  }

  return (

    <div className="flex flex-col items-center justify-start text-left min-h-svh w-full px-3 py-16 gap-8">
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
          <CardTitle className="text-lg">Welcome to Faved demo!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <p>Before you can use the application, we need to set up the database with demo content. Click the button below to proceed.</p>

          <div className="bg-blue-100 p-4 rounded-lg  dark:bg-blue-600">
            <p className="italic">All demo accounts are private. Feel free to add your own links - they will not be accessed by anyone except you.</p>
            <br />
            <p className="italic">Demo accounts are deleted after 14 days.</p>
          </div>
          <Button className="w-full" disabled={isLoading}
                  onClick={submit}>
            {isLoading ? 'Creating Database...' : 'Initialize Demo'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
})
