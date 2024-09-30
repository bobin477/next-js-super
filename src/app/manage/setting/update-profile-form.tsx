"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  UpdateMeBody,
  UpdateMeBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccountProfile,
  useUpdateMeMutation,
} from "@/app/useQueries/accountQueries";
import { useUploadMediaMutation } from "@/app/useQueries/mediaQueries";
import { toast } from "@/hooks/use-toast";
import { handleErrorApi } from "@/lib/utils";
export default function UpdateProfileForm() {
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: "",
      avatar: "",
    },
  });
  const refInputAvatar = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | undefined>();
  const { data, refetch } = useAccountProfile();
  const updateMeMutation = useUpdateMeMutation();
  const upLoadMediaMutation = useUploadMediaMutation();

  const avatar = form.watch("avatar");
  const name = form.watch("name");

  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data;
      form.reset({
        name,
        avatar: avatar ?? "",
      });
    }
  }, [form, data]);

  const previewImage = useMemo(() => {
    if (file) {
      const avatarUrl = URL.createObjectURL(file);
      return avatarUrl;
    }
    return avatar;
  }, [file, avatar]);

  const handleReset = () => {
    form.reset();
    setFile(undefined);
  };

  const handleSubmit = async (values: UpdateMeBodyType) => {
    let body = values;
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await upLoadMediaMutation.mutateAsync(formData);
        const imageUrl = result.payload.data;

        body = {
          ...values,
          avatar: imageUrl,
        };
      }

      const result = await updateMeMutation.mutateAsync(body);
      toast({
        description: result.payload.message,
      });
      refetch();
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        noValidate
        className="grid auto-rows-max items-start gap-4 md:gap-8"
        onSubmit={form.handleSubmit(handleSubmit, (e) => {
          console.log(e);
        })}
      >
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-start">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewImage} />
                        <AvatarFallback className="rounded-none">
                          {name}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={refInputAvatar}
                        onChange={(e) => {
                          if (e.target.files) {
                            setFile(e.target.files[0]);
                          }
                          field.onChange("http://localhost:3000/" + field.name);
                        }}
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => {
                          refInputAvatar.current?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid gap-3">
                      <Label htmlFor="name">Tên</Label>
                      <Input
                        id="name"
                        type="text"
                        className="w-full"
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className=" items-center gap-2 md:ml-auto flex">
                <Button
                  variant="outline"
                  size="sm"
                  type="reset"
                  onClick={handleReset}
                >
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
