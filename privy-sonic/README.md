# SonicSVM x Privy Auth `create-next-app` Starter

This is a template for integrating [**Privy Auth**](https://www.privy.io/) into a [NextJS](https://nextjs.org/) project on SonicSVM Network.

This demo uses NextJS's [Pages Router](https://nextjs.org/docs/pages/building-your-application/routing). If you'd like to see an example using the [App Router](https://nextjs.org/docs/app), just change the branch of this repository to [`app-router`](https://github.com/privy-io/create-next-app/tree/app-router).

## Setup

1. Clone this repository and open it in your terminal.

```sh
git clone https://github.com/mirrorworld-universe/sonic-templates-monorepo
```

2. Install the necessary dependencies

```sh
npm i
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, [paste your Privy App ID from the dashboard](https://docs.privy.io/guide/dashboard/api-keys).

```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login with Privy and send transaction on SonicSVM Network!

**Check out [our docs](https://docs.sonicsvm.com/) for more tools and resources to build on SonicSVM Network!**
