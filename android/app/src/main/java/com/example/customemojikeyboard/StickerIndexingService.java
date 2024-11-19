package com.example.customemojikeyboard;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.core.app.JobIntentService;

import com.google.android.gms.tasks.Task;
import com.google.firebase.appindexing.FirebaseAppIndex;
import com.google.firebase.appindexing.FirebaseAppIndexingInvalidArgumentException;
import com.google.firebase.appindexing.Indexable;
import com.google.firebase.appindexing.builders.Indexables;
import com.google.firebase.appindexing.builders.StickerBuilder;
import com.google.firebase.appindexing.builders.StickerPackBuilder;

public class StickerIndexingService extends JobIntentService {

    private static final int UNIQUE_JOB_ID = 42;

    public static void enqueueWork(Context context) {
        enqueueWork(context, StickerIndexingService.class, UNIQUE_JOB_ID, new Intent());
    }

    @Override
    protected void onHandleWork(@NonNull Intent intent) {
        String smileyImageUri = Uri.parse("android.resource://com.example.custimemojikeyboard/drawable/blue").toString();
        StickerBuilder smileyStickerBuilder = Indexables.stickerBuilder()
                .setName("smiley")
                .setUrl("mystickers://sticker/smiley")
                .setImage(smileyImageUri)
                .setDescription("Melissa smiling!")
                .setKeywords("Melissa", "smiley")
                .setIsPartOf(Indexables.stickerPackBuilder().setName("Melissa"));

        StickerPackBuilder stickerPackBuilder = Indexables.stickerPackBuilder()
                .setName("Melissa")
                .setUrl("mystickers://sticker/pack/melissa")
                .setHasSticker(smileyStickerBuilder);


        try {
            new Indexable.Builder("Sticker")
                    .setName("Bye")
                    // add url for sticker asset
                    .setImage("http://www.snoopysticker.com?id=1234")
                    // see: Support links to your app content section
                    .setUrl("http://sticker/canonical/image/bye")
                    // Set the accessibility label for the sticker.
                    .setDescription("A sticker for Bye")
                    // Add search keywords.
                    .put("keywords", "bye", "snoopy", "see ya", "good bye")
                    .put("isPartOf",
                            new Indexable.Builder("StickerPack")
                                    .setName("Snoopy Pack")
                                    .build())
                    .build();
        } catch (FirebaseAppIndexingInvalidArgumentException e) {
            throw new RuntimeException(e);
        };

//        Task<Void> update = FirebaseAppIndex.getInstance(null).update(
//                stickerPackBuilder.build(),
//                smileyStickerBuilder.build());
    }

}
