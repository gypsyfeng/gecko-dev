/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_quota_UsageRequest_h
#define mozilla_dom_quota_UsageRequest_h

#include "nsCOMPtr.h"
#include "nsCycleCollectionParticipant.h"
#include "nsIQuotaRequests.h"
#include "nsIVariant.h"

class nsIPrincipal;
class nsIQuotaCallback;
class nsIQuotaUsageCallback;
struct PRThread;

namespace mozilla {
namespace dom {
namespace quota {

class QuotaUsageRequestChild;

class RequestBase
  : public nsIQuotaRequestBase
{
protected:
#ifdef DEBUG
  PRThread* mOwningThread;
#endif

  nsCOMPtr<nsIPrincipal> mPrincipal;

  nsresult mResultCode;
  bool mHaveResultOrErrorCode;

public:
  void
  AssertIsOnOwningThread() const
#ifdef DEBUG
  ;
#else
  { }
#endif

  void
  SetError(nsresult aRv);

  NS_DECL_CYCLE_COLLECTING_ISUPPORTS
  NS_DECL_NSIQUOTAREQUESTBASE
  NS_DECL_CYCLE_COLLECTION_CLASS(RequestBase)

protected:
  RequestBase();

  RequestBase(nsIPrincipal* aPrincipal);

  virtual ~RequestBase()
  {
    AssertIsOnOwningThread();
  }

  virtual void
  FireCallback() = 0;
};

class UsageRequest final
  : public RequestBase
  , public nsIQuotaUsageRequest
{
  nsCOMPtr<nsIQuotaUsageCallback> mCallback;

  uint64_t mUsage;
  uint64_t mFileUsage;

  // Group Limit.
  uint64_t mLimit;

  QuotaUsageRequestChild* mBackgroundActor;

  bool mCanceled;

public:
  UsageRequest(nsIPrincipal* aPrincipal,
               nsIQuotaUsageCallback* aCallback);

  void
  SetBackgroundActor(QuotaUsageRequestChild* aBackgroundActor);

  void
  ClearBackgroundActor()
  {
    AssertIsOnOwningThread();

    mBackgroundActor = nullptr;
  }

  void
  SetResult(uint64_t aUsage, uint64_t aFileUsage, uint64_t aLimit);

  NS_DECL_ISUPPORTS_INHERITED
  NS_FORWARD_NSIQUOTAREQUESTBASE(RequestBase::)
  NS_DECL_NSIQUOTAUSAGEREQUEST
  NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED(UsageRequest, RequestBase)

private:
  ~UsageRequest();

  virtual void
  FireCallback() override;
};

class Request final
  : public RequestBase
  , public nsIQuotaRequest
{
  nsCOMPtr<nsIQuotaCallback> mCallback;

  nsCOMPtr<nsIVariant> mResult;

public:
  Request();

  explicit Request(nsIPrincipal* aPrincipal);

  void
  SetResult(nsIVariant* aResult);

  NS_DECL_ISUPPORTS_INHERITED
  NS_FORWARD_NSIQUOTAREQUESTBASE(RequestBase::)
  NS_DECL_NSIQUOTAREQUEST
  NS_DECL_CYCLE_COLLECTION_CLASS_INHERITED(Request, RequestBase)

private:
  ~Request();

  virtual void
  FireCallback() override;
};

} // namespace quota
} // namespace dom
} // namespace mozilla

#endif // mozilla_dom_quota_UsageRequest_h
