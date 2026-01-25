"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session } = authClient.useSession();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    authClient.signUp.email(
      { email, name, password },
      {
        onSuccess: () => alert("User created"),
        onError: () => alert("Signup failed"),
      }
    );
  };

  const onLogin = () => {
    authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => alert("Logged in"),
        onError: () => alert("Login failed"),
      }
    );
  };

  if (session) {
    return (
      <div className="p-4 flex flex-col gap-y-4">
        <p>Logged in as {session.user.name}</p>
        <Button onClick={() => authClient.signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-y-4">
      {!isLogin && (
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isLogin ? (
        <Button onClick={onLogin}>Login</Button>
      ) : (
        <Button onClick={onSubmit}>Create Account</Button>
      )}

      <Button
        variant="outline"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Create new account" : "Already have an account?"}
      </Button>
    </div>
  );
};
