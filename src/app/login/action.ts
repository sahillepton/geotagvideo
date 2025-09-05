"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { postData } from "../actions/postdata";
import { redirect } from "next/navigation";

export type FormState = {errors ? : { username ? : string[], password ?: string[]}} | undefined
export async function login(state: FormState, formData: FormData, ) {
    const schema = z.object({
        username: z.string().min(1, {message: 'Please enter a valid username.'}).trim(),
  password: z
    .string()
    .min(5, { message: 'Please enter a valid password.' })
    .trim(),
    });

    const validatedFields = schema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { username, password } = validatedFields.data;

    try {
       

        const loginData = await postData("/api/Video/LoginUser", {
            data: `{ \"User_Name\":\"${username}\", \"Password\":\"${password}\"}`,
        })

        const user = JSON.parse(loginData.data);

        const cookieStore = await cookies();
        cookieStore.set("user", JSON.stringify(user.Result), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365 * 100, // ~100 years
            path: "/"
          });
          
    
    } catch (error) {
        return {
            errors: {
                username: ['Invalid username or password'],
            },
        }
       
    }

    redirect("/geotaggedvideos");
}