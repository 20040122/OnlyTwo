import OnboardingForm from "@/features/profile/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            完善资料
          </h1>
          <p className="text-sm text-zinc-600">
            对应 profiles 表，首期只需要昵称和头像。
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
