/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "mozilla/dom/FileSystemRequestParent.h"
#include "mozilla/dom/PFileSystemParams.h"

#include "GetDirectoryListingTask.h"
#include "GetFileOrDirectoryTask.h"

#include "mozilla/dom/FileSystemBase.h"
#include "mozilla/ipc/BackgroundParent.h"

using namespace mozilla::ipc;

namespace mozilla {
namespace dom {

FileSystemRequestParent::FileSystemRequestParent()
  : mDestroyed(false)
{
  AssertIsOnBackgroundThread();
}

FileSystemRequestParent::~FileSystemRequestParent()
{
  AssertIsOnBackgroundThread();
}

#define FILESYSTEM_REQUEST_PARENT_DISPATCH_ENTRY(name)                         \
    case FileSystemParams::TFileSystem##name##Params: {                        \
      const FileSystem##name##Params& p = aParams;                             \
      mFileSystem = new OSFileSystemParent(p.filesystem());                    \
      MOZ_ASSERT(mFileSystem);                                                 \
      mTask = name##TaskParent::Create(mFileSystem, p, this, rv);              \
      if (NS_WARN_IF(rv.Failed())) {                                           \
        rv.SuppressException();                                                \
        return false;                                                          \
      }                                                                        \
      break;                                                                   \
    }

bool
FileSystemRequestParent::Initialize(const FileSystemParams& aParams)
{
  AssertIsOnBackgroundThread();

  ErrorResult rv;

  switch (aParams.type()) {

    FILESYSTEM_REQUEST_PARENT_DISPATCH_ENTRY(GetDirectoryListing)
    FILESYSTEM_REQUEST_PARENT_DISPATCH_ENTRY(GetFileOrDirectory)
    FILESYSTEM_REQUEST_PARENT_DISPATCH_ENTRY(GetFiles)

    default: {
      MOZ_CRASH("not reached");
      break;
    }
  }

  if (NS_WARN_IF(!mTask || !mFileSystem)) {
    // Should never reach here.
    return false;
  }

  return true;
}

void
FileSystemRequestParent::Start()
{
  MOZ_ASSERT(!mDestroyed);
  MOZ_ASSERT(mFileSystem);
  MOZ_ASSERT(mTask);

  mTask->Start();
}

void
FileSystemRequestParent::ActorDestroy(ActorDestroyReason aWhy)
{
  AssertIsOnBackgroundThread();
  MOZ_ASSERT(!mDestroyed);

  if (!mFileSystem) {
    return;
  }

  mFileSystem->Shutdown();
  mFileSystem = nullptr;
  mTask = nullptr;
  mDestroyed = true;
}

} // namespace dom
} // namespace mozilla
