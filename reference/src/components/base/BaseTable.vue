<script setup lang="ts">
/**
 * Duenner Rahmen um eine <table>: kuemmert sich nur um Rahmen, Abstaende und
 * darum, dass die Tabelle auf schmalen Bildschirmen *in sich* scrollt statt
 * die ganze Seite breit zu machen.
 *
 * Der Inhalt kommt komplett ueber Slots - die Komponente weiss nichts ueber
 * Noten oder Studierende und ist damit wiederverwendbar.
 */
</script>

<template>
  <div class="-mx-5 overflow-x-auto px-5">
    <table class="w-full min-w-lg border-collapse text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-left dark:border-slate-800">
          <slot name="head" />
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <slot />
      </tbody>
    </table>
  </div>
</template>
