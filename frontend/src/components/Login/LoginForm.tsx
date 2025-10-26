import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import z from "zod"
import {useContext, useEffect, useState} from "react"
import {StoreContext} from "@/store/storeContext"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form"
import {useLocation, useNavigate} from "react-router-dom"
import {observer} from "mobx-react-lite"
import {Loader2Icon} from "lucide-react"

const formSchema = z.object({
  username: z
    .string().min(1, {message: "Username is required"}),
  password: z
    .string().min(1, {message: "Password is required"})
})
export const LoginForm = observer(({className, ...props}: React.ComponentProps<"div">) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const store = useContext(StoreContext);
    const navigate = useNavigate();

    // Redirect if user already logged in
    useEffect(() => {
      if (store.isAuthRequired) {
        return;
      }

      const redirectUrl = location.state?.from?.pathname
        ? location.state.from.pathname + location.state?.from?.search
        : '/';
      navigate(redirectUrl, {replace: true});
    }, [store.isAuthRequired])


    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: "",
        password: '',
      },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
      store.login(values, setIsLoading);
    }

    return (

      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex items-center justify-center">
          <img
            src="logo.png"
            alt="Faved logo"
            className="w-[36px] h-auto mr-3"
          />
          <h2 className="text-2xl font-semibold tracking-tight m-0">Faved</h2>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                  Enter your Username and Password below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Username" autoComplete="username" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({field}) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel>Password</FormLabel>
                          </div>
                          <FormControl>
                            <Input type="password" autoComplete="new-password" placeholder="Password" {...field}
                                   disabled={isLoading}/>
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button onClick={form.handleSubmit(onSubmit)} type="submit" className="w-full">
                      {isLoading && <Loader2Icon className=" mr-2 h-4 w-4 animate-spin"/>}
                      Login
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    )
  }
)