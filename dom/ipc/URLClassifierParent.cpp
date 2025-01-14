/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "URLClassifierParent.h"
#include "nsComponentManagerUtils.h"
#include "mozilla/Unused.h"

using namespace mozilla;
using namespace mozilla::dom;

NS_IMPL_ISUPPORTS(URLClassifierParent, nsIURIClassifierCallback)

mozilla::ipc::IPCResult
URLClassifierParent::StartClassify(nsIPrincipal* aPrincipal,
                                   bool aUseTrackingProtection,
                                   bool* aSuccess)
{
  *aSuccess = false;
  nsresult rv = NS_OK;
  // Note that in safe mode, the URL classifier service isn't available, so we
  // should handle the service not being present gracefully.
  nsCOMPtr<nsIURIClassifier> uriClassifier =
    do_GetService(NS_URICLASSIFIERSERVICE_CONTRACTID, &rv);
  if (NS_SUCCEEDED(rv)) {
    rv = uriClassifier->Classify(aPrincipal, nullptr, aUseTrackingProtection,
                                 this, aSuccess);
  }
  if (NS_FAILED(rv) || !*aSuccess) {
    // We treat the case where we fail to classify and the case where the
    // classifier returns successfully but doesn't perform a lookup as the
    // classification not yielding any results, so we just kill the child actor
    // without ever calling out callback in both cases.
    // This means that code using this in the child process will only get a hit
    // on its callback if some classification actually happens.
    *aSuccess = false;
    ClassificationFailed();
  }
  return IPC_OK();
}

nsresult
URLClassifierParent::OnClassifyComplete(nsresult aErrorCode,
                                        const nsACString& aList,
                                        const nsACString& aProvider,
                                        const nsACString& aPrefix)
{
  if (mIPCOpen) {
    ClassifierInfo info;
    info.list() = aList;
    info.prefix() = aPrefix;
    info.provider() = aProvider;

    Unused << Send__delete__(this, info, aErrorCode);
  }
  return NS_OK;
}

void
URLClassifierParent::ClassificationFailed()
{
  if (mIPCOpen) {
    Unused << Send__delete__(this, void_t(), NS_ERROR_FAILURE);
  }
}

void
URLClassifierParent::ActorDestroy(ActorDestroyReason aWhy)
{
  mIPCOpen = false;
}
