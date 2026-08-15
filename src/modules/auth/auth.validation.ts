import z, { email, string } from "zod"

export const signupValidation = z.strictObject({
    username: z.string().min(2),
    email: z.email(),
    password: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    confirmpassword: z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)

}).superRefine((data, ctx) => {
    if (data.confirmpassword !== data.password) {
        ctx.addIssue({
            code: "custom",
            message: "password mismatched confirmpassword",
            path: ["confirmpassword"]
        })

    }

})